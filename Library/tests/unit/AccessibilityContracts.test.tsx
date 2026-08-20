import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModelLightbox } from "../../components/ModelLightbox";
import { TreeMenu } from "../../components/TreeMenu";

describe("shared accessibility contracts", () => {
  it("does not render a focusable toggle for tree leaf nodes", () => {
    render(
      <TreeMenu
        defaultExpandedIds={["documents"]}
        nodes={[
          { id: "documents", label: "Documents", children: [{ id: "proposal", label: "Proposal" }] },
        ]}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Proposal" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /expand proposal|collapse proposal/i })).not.toBeInTheDocument();
  });

  it("keeps supplied interactive lightbox content outside the activation button", () => {
    const { container } = render(
      <ModelLightbox
        asset={{ alt: "Product model", name: "Product model", src: "/model.glb" }}
        trigger={<button type="button">Viewer poster</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Open 3D asset" })).toBeInTheDocument();
    expect(container.querySelector("button button")).toBeNull();
  });
});
