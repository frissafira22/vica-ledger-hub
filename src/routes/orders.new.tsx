import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/orders/new")({
  beforeLoad: () => {
    throw redirect({ to: "/orders" });
  },
  component: () => null,
});
