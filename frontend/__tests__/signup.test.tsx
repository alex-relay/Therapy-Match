import React from "react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import SignUpPage from "../src/app/register/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as createUser from "../src/app/api/routes/auth";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("User Creation", () => {
  const queryClient = new QueryClient();

  const renderHook = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SignUpPage />
      </QueryClientProvider>,
    );
  };

  it("renders the sign in card and displays an error for email, password, first name, and last name on submit", async () => {
    const createUserSpy = jest.spyOn(createUser, "createUser");

    const user = userEvent.setup();

    renderHook();

    expect(await screen.findByLabelText("First name")).toBeInTheDocument();
    expect(await screen.findByLabelText("Last name")).toBeInTheDocument();

    const emailInput = await screen.findByPlaceholderText("Enter Email");
    const passwordInput = await screen.findByPlaceholderText("••••••");

    await user.type(passwordInput, "test");
    await user.type(emailInput, "test");

    user.click(screen.getByTestId("signup-button"));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        "Password must be at least 6 characters long, and contain one number and one uppercase letter.",
      ),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("First name is required."),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Last name is required."),
    ).toBeInTheDocument();

    expect(createUserSpy).not.toHaveBeenCalled();
  });

  it("renders the sign in card and submits the form with correctly completed fields", async () => {
    const user = userEvent.setup();

    renderHook();

    expect(await screen.findByLabelText("First name")).toBeInTheDocument();
    expect(await screen.findByLabelText("Last name")).toBeInTheDocument();

    const emailInput = await screen.findByPlaceholderText("Enter Email");
    const passwordInput = await screen.findByPlaceholderText("••••••");
    const lastNameInput = await screen.findByPlaceholderText("Last Name");
    const firstNameInput = await screen.findByPlaceholderText("First Name");

    await user.type(passwordInput, "Password1");
    await user.type(emailInput, "test@test.com");
    await user.type(lastNameInput, "last");
    await user.type(firstNameInput, "first");

    await user.click(screen.getByTestId("signup-button"));

    expect(
      screen.queryByText("Please enter a valid email address."),
    ).not.toBeInTheDocument();

    expect(
      await screen.queryByText(
        "Password must be at least 6 characters long, and contain one number and one uppercase letter.",
      ),
    ).not.toBeInTheDocument();

    expect(
      await screen.queryByText("First name is required."),
    ).not.toBeInTheDocument();

    expect(
      await screen.queryByText("Last name is required."),
    ).not.toBeInTheDocument();
  });
});
