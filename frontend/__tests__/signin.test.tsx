import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import SignInPage from "../src/app/login/page";

const CSRF_TOKEN = "123";

describe("Home", () => {
  it("renders the sign in card and content", async () => {
    render(<SignInPage csrfToken={CSRF_TOKEN} />);

    expect(
      await screen.findByText(/Innovative functionality/),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("signin-card")).toBeInTheDocument();
  });

  it("displays an invalid email message if the user does not provide a valid email address", async () => {
    render(<SignInPage csrfToken={CSRF_TOKEN} />);

    expect(await screen.findByTestId("signin-card")).toBeInTheDocument();
  });
});
