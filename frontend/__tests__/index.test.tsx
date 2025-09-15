import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "../src/app/page";

describe("Home", () => {
  it("renders a heading", async () => {
    render(<Home />);

    expect(await screen.findByText(/Get Started/)).toBeInTheDocument();
  });
});
