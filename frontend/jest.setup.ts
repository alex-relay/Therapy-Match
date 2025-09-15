import "@testing-library/jest-dom"; // Optional, for extended DOM matchers
import { server } from "./src/mocks/server";
import { FormData } from "formdata-node";

global.FormData = FormData as any;

beforeAll(() => server.listen()); // Start the server before all tests
afterEach(() => server.resetHandlers()); // Reset handlers after each test
afterAll(() => server.close()); // Stop the server after all tests
