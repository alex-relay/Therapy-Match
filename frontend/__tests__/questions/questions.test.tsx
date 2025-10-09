import React from "react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as questions from "../../src/app/api/profile/profile";
import Questions from "../../src/app/questions/[step]/page";
import { useParams } from "next/navigation";

jest.mock("next/navigation");

const useParamsMock = useParams as jest.MockedFunction<typeof useParams>;

describe("Questions pages", () => {
  const queryClient = new QueryClient();

  it("renders the GenderForm and makes a patch request on an option click", async () => {
    const renderQuestionsPage = () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Questions />
        </QueryClientProvider>,
      );
    };

    useParamsMock.mockReturnValue({ step: "1" });

    const user = userEvent.setup();

    renderQuestionsPage();

    const usePatchQuestionSpy = jest.spyOn(questions, "usePatchQuestion");

    expect(
      await screen.findByText(/What is your gender identity/),
    ).toBeInTheDocument();

    await user.click(screen.getByText("Male"));

    expect(usePatchQuestionSpy).toHaveBeenCalled();
  });

  it("renders the Age form and makes a patch request on submitting an age", async () => {
    const renderQuestionsPage = () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Questions />
        </QueryClientProvider>,
      );
    };

    useParamsMock.mockReturnValue({ step: "2" });

    const user = userEvent.setup();

    renderQuestionsPage();

    expect(await screen.findByText(/What is your age/)).toBeInTheDocument();

    const ageInput = screen.getByPlaceholderText("e.g. 27");

    await user.type(ageInput, "27");

    expect(ageInput).toHaveValue("27");

    const usePatchQuestionSpy = jest.spyOn(questions, "usePatchQuestion");
    await user.keyboard("{enter}");

    expect(usePatchQuestionSpy).toHaveBeenCalled();
  });

  it("renders the Age form and shows an error based on an invalid number", async () => {
    const renderQuestionsPage = () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Questions />
        </QueryClientProvider>,
      );
    };

    useParamsMock.mockReturnValue({ step: "2" });

    const user = userEvent.setup();

    renderQuestionsPage();

    expect(await screen.findByText(/What is your age/)).toBeInTheDocument();

    const ageInput = screen.getByPlaceholderText("e.g. 27");

    await user.type(ageInput, "17");

    expect(ageInput).toHaveValue("17");

    await user.keyboard("{enter}");

    expect(
      await screen.findByText("Please enter a valid age between 18 and 120."),
    );
  });

  it("renders the Age form and shows an error because of a non-numeric input", async () => {
    const renderQuestionsPage = () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Questions />
        </QueryClientProvider>,
      );
    };

    useParamsMock.mockReturnValue({ step: "2" });

    const user = userEvent.setup();

    renderQuestionsPage();

    expect(await screen.findByText(/What is your age/)).toBeInTheDocument();

    const ageInput = screen.getByPlaceholderText("e.g. 27");

    await user.type(ageInput, "abc");

    await user.keyboard("{enter}");

    expect(
      await screen.findByText("Please enter a valid age between 18 and 120."),
    );
  });
});
