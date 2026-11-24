import { APP_NAME } from "@/shared/lib/app-name";

export function HomePage() {
    return (
        <main className="p-8">
            <h1 className="text-page-title">{APP_NAME}</h1>
        </main>
    );
}
