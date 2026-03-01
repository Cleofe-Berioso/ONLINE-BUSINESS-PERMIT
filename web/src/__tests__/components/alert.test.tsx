import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "@/components/ui/alert";

describe("Alert", () => {
  it("renders with children", () => {
    render(<Alert>Test message</Alert>);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders info variant by default", () => {
    const { container } = render(<Alert>Info</Alert>);
    expect(container.firstChild).toHaveClass("bg-blue-50");
  });

  it("renders success variant", () => {
    const { container } = render(<Alert variant="success">Success</Alert>);
    expect(container.firstChild).toHaveClass("bg-green-50");
  });

  it("renders error variant", () => {
    const { container } = render(<Alert variant="error">Error</Alert>);
    expect(container.firstChild).toHaveClass("bg-red-50");
  });

  it("renders warning variant", () => {
    const { container } = render(<Alert variant="warning">Warning</Alert>);
    expect(container.firstChild).toHaveClass("bg-yellow-50");
  });
});
