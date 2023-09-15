export const Heading = (props: React.PropsWithChildren) => (
  <div className="flex w-2/3 flex-row items-center justify-end gap-2 bg-main-accent py-2 pr-2 font-headers">
    <hr className="flex-grow" />
    {props.children}
  </div>
);
