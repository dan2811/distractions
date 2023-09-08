const Layout = (props: React.PropsWithChildren) => (
  <main className=" flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
    {props.children}
  </main>
);

export default Layout;
