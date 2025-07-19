import { LoginForm } from "@/components/forms";
import { CompanyLogo } from "@/assets";

function LoginView() {
  return (
    <main className="h-full w-full flex justify-center items-center p-5 overflow-auto">
      <section className="h-full max-h-[100dvh] w-full flex flex-col items-center justify-between lg:justify-center lg:flex-row-reverse gap-7 md:gap-24 lg:gap-24 px-5 py-5 md:h-[813px] lg:h-[349px] md:mx-auto md:my-auto">
        <section className="h-[389px] w-full max-w-[600px] lg:h-[332px] lg:w-[600px] flex flex-col justify-start items-center lg:items-start">
          <CompanyLogo className="h-24 w-24" />
          <div className="w-full flex flex-col gap-[10px]">
            <span className="text-3xl md:text-6xl md:leading-[81.71px] font-[600] w-full text-center lg:text-left">
              WELCOME TO ADMIN DASHBOARD
            </span>
            <span className="text-sm text-center lg:text-left">
              Login to the cashless dashboard to monitor all of you event's
              activities
            </span>
          </div>
        </section>
        <LoginForm />
      </section>
    </main>
  );
}

export default LoginView;
