import React from "react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent } from "@testing-library/react";
import SignInPage from "../src/app/login/page";
import { signIn } from "next-auth/react";

const CSRF_TOKEN = "123";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("User Login", () => {
  it("renders the sign in card and content", async () => {
    render(<SignInPage csrfToken={CSRF_TOKEN} />);

    expect(
      await screen.findByText(/Innovative functionality/),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("signin-card")).toBeInTheDocument();
  });

  it("displays an invalid password message if the user does not provide a valid password", async () => {
    render(<SignInPage csrfToken={CSRF_TOKEN} />);

    expect(await screen.findByTestId("signin-card")).toBeInTheDocument();

    const passwordInput = screen.getByPlaceholderText("••••••");
    await userEvent.type(passwordInput, "test");
    expect(passwordInput).toHaveValue("test");

    fireEvent.click(screen.getByTestId("signin-button"));

    expect(
      await screen.findByText("Password must be at least 6 characters long."),
    ).toBeInTheDocument();
  });

  it("displays an invalid email message if the user does not provide a valid email address", async () => {
    render(<SignInPage csrfToken={CSRF_TOKEN} />);

    expect(await screen.findByTestId("signin-card")).toBeInTheDocument();

    const passwordInput = screen.getByPlaceholderText("••••••");
    await userEvent.type(passwordInput, "Testing01");
    expect(passwordInput).toHaveValue("Testing01");

    const emailInput = screen.getByPlaceholderText("Enter Email Address");
    await userEvent.type(emailInput, "test");
    expect(emailInput).toHaveValue("test");

    fireEvent.click(screen.getByTestId("signin-button"));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("successfully creates a token when the user logs in", async () => {
    render(<SignInPage csrfToken={CSRF_TOKEN} />);

    const user = userEvent.setup(); // Initialize user-event
    expect(await screen.findByTestId("signin-card")).toBeInTheDocument();

    const passwordInput = screen.getByPlaceholderText("••••••");
    await user.type(passwordInput, "Testing01");
    expect(passwordInput).toHaveValue("Testing01");

    const emailInput = screen.getByPlaceholderText("Enter Email Address");
    await user.type(emailInput, "test@test.com");
    expect(emailInput).toHaveValue("test@test.com");

    await user.click(screen.getByTestId("signin-button"));

    expect(signIn).toHaveBeenCalledWith("credentials", {
      callbackUrl: "/profile",
      redirect: true,
      emailAddress: null,
      password: null,
    });
  });
});
