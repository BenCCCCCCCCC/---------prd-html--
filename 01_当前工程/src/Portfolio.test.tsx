import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { DecisionCard } from "./Portfolio";
import data from "../specs/portfolio-decisions.json";
afterEach(cleanup);
it("AC31 quick and deep presentation consume identical canonical decision values", () => {
  for (const id of data.quickScanDecisionIds) {
    const d = data.decisions.find((d) => d.id === id)!;
    const { unmount } = render(<DecisionCard d={d} quick />);
    expect(screen.getByText(d.tradeoff, { exact: false })).toBeTruthy();
    expect(screen.getByText(d.validation)).toBeTruthy();
    expect(
      screen.getByText(d.options.find((o) => o.id === d.selectedOption)!.label),
    ).toBeTruthy();
    unmount();
  }
});
it("AC32 each canonical option renders the appropriate adopted/rejected/deferred label", () => {
  for (const d of data.decisions) {
    const { container, unmount } = render(<DecisionCard d={d} />);
    for (const o of d.options) expect(container.textContent).toContain(o.label);
    expect(container.textContent).toContain("代价");
    expect(container.textContent).toContain(d.validation);
    if (d.options.some((o) => o.status === "deferred"))
      expect(container.textContent).toContain("延后");
    unmount();
  }
});
