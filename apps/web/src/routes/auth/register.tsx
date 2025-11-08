import { createFileRoute } from "@tanstack/react-router";

// import SignUpForm from '~/components/sign-up-form';

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      {/* <SignUpForm onSwitchToSignIn={() => {}} /> */}
    </div>
  );
}
