import LoginServerAction from "./server-action";

export default function Page() {
  return (
    <div>
      <form action={LoginServerAction}>
        <button type="submit">Server Redirect Login</button>
      </form>
    </div>
  );
}
