/**
 * Follow-up chips are toggles, not one-shots.
 *
 * The agent offers up to three and a user often wants two of them in one turn.
 * A chip that replaced the composer made the second click destroy the first,
 * and once the turn was sent there was no way back to the other two. So a chip
 * reports its own pressed state, and whatever empties the composer releases
 * every chip that described it.
 */

import type { JobDiffBundle } from "@airship/protocol";
import { describe, expect, it, vi } from "vitest";
import { cls, el } from "../dom";
import { toggleFollowUpLine } from "./follow-ups";
import { fillAssistant, releaseFollowUps } from "./transcript";

function bundle(followUps: string[]): JobDiffBundle {
  return {
    agent: "claude",
    createdAt: 0,
    diffs: [],
    filesChanged: 0,
    followUps,
    jobId: "job-1",
    prompt: "tighten the hero",
    promptPreview: "tighten the hero",
    status: "done",
    target: {},
  } as unknown as JobDiffBundle;
}

/** The chips, after opening the disclosure they fold behind. */
function chips(target: HTMLElement): HTMLButtonElement[] {
  const head = target.querySelector(
    `.${cls("follow-disc")} .${cls("disc-head")}`
  );
  if (
    head instanceof HTMLElement &&
    head.getAttribute("aria-expanded") !== "true"
  ) {
    head.click();
  }
  return [...target.querySelectorAll(`.${cls("follow")} button`)].filter(
    (b): b is HTMLButtonElement => b instanceof HTMLButtonElement
  );
}

describe("follow-up chips", () => {
  it("toggle, and report each state with the text", () => {
    const onFollowUp = vi.fn();
    const target = el("div");
    fillAssistant(target, bundle(["Tighten the focus ring", "Bump the gap"]), {
      onFollowUp,
    });
    const [first, second] = chips(target);

    first.click();
    second.click();
    first.click();

    expect(onFollowUp.mock.calls).toEqual([
      ["Tighten the focus ring", true],
      ["Bump the gap", true],
      ["Tighten the focus ring", false],
    ]);
    expect(first.getAttribute("aria-pressed")).toBe("false");
    expect(second.getAttribute("aria-pressed")).toBe("true");
  });

  it("are released together when the composer they describe is emptied", () => {
    const target = el("div");
    fillAssistant(target, bundle(["One", "Two", "Three"]), {
      onFollowUp: vi.fn(),
    });
    const all = chips(target);
    expect(all).toHaveLength(3);
    for (const chip of all) {
      chip.click();
    }
    expect(all.every((c) => c.getAttribute("aria-pressed") === "true")).toBe(
      true
    );

    // Folded again: the body is detached, and the release must still reach it.
    const head = target.querySelector(`.${cls("disc-head")}`);
    (head as HTMLElement).click();
    expect(target.contains(all[0])).toBe(false);

    releaseFollowUps(target);

    expect(all.every((c) => c.getAttribute("aria-pressed") === "false")).toBe(
      true
    );
  });

  it("are not offered without a handler", () => {
    const target = el("div");
    fillAssistant(target, bundle(["One"]), {});
    expect(chips(target)).toHaveLength(0);
  });
});

describe("toggleFollowUpLine", () => {
  it("adds a line to an empty composer without a leading break", () => {
    expect(toggleFollowUpLine("", "One", true)).toBe("One");
  });

  it("stacks pressed chips as lines under what was typed", () => {
    const a = toggleFollowUpLine("make it bluer", "One", true);
    const b = toggleFollowUpLine(a, "Two", true);
    expect(b).toBe("make it bluer\nOne\nTwo");
  });

  it("removes only the line a released chip added", () => {
    const typed = "make it bluer\nOne\nTwo";
    expect(toggleFollowUpLine(typed, "One", false)).toBe("make it bluer\nTwo");
  });

  it("leaves the field alone when the line is already gone", () => {
    expect(toggleFollowUpLine("make it bluer", "One", false)).toBe(
      "make it bluer"
    );
  });
});
