export const Heading = (props: React.PropsWithChildren) => (
  <div className="sticky top-14 flex w-2/3 flex-row items-center justify-end gap-2 rounded-r-md bg-main-accent py-2 pr-2 font-headers md:max-w-sm">
    <hr className="flex-grow" />
    {props.children}
  </div>
);
