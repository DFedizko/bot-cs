import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { definePort } from "./define-port";

type Greeter = { greet: () => string };

const GREETING = "Hello";
const PORT_NAME = "Greeter";
const { Provider: GreeterProvider, usePort: useGreeter } = definePort<Greeter>(PORT_NAME);

function Greeting() {
    return <p>{useGreeter().greet()}</p>;
}

describe("definePort", () => {
    it("Should give consumers the implementation bound by its provider", () => {
        render(
            <GreeterProvider value={{ greet: () => GREETING }}>
                <Greeting />
            </GreeterProvider>,
        );

        expect(screen.getByText(GREETING)).toBeInTheDocument();
    });

    it("Should fail naming the port when no implementation is bound", () => {
        const renderUnbound = () => render(<Greeting />);

        expect(renderUnbound).toThrow(PORT_NAME);
    });
});
