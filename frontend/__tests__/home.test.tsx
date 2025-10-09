import React from "react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import Home from "../src/app/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as users from "../src/app/api/users/users";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("Home page", () => {
  const queryClient = new QueryClient();

  const renderHomePage = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>,
    );
  };

  it("renders the sign in card and content", async () => {
    const user = userEvent.setup();

    renderHomePage();

    const createAnonymouSessionSpy = jest.spyOn(
      users,
      "useCreateAnonymousSession",
    );

    expect(
      await screen.findByText(/What type of therapy are you looking for/),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("myself-tile"));

    expect(createAnonymouSessionSpy).toHaveBeenCalled();
    expect(createAnonymouSessionSpy).toHaveReturned();
  });
});
