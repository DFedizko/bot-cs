import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "@/app/app-name";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
    return (
        <main className="p-8">
            <h1 className="text-4xl font-bold">{APP_NAME}</h1>
        </main>
    );
}
