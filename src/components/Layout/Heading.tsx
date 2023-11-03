export const Heading = (props: React.PropsWithChildren) => (
  <div className="flex w-2/3 flex-row items-center justify-end gap-2 rounded-r-md border-b-2  border-r-2 border-gray-700 border-opacity-30 bg-gray-400 bg-opacity-20 py-2 pr-2 font-headers backdrop-blur-md backdrop-filter md:max-w-sm">
    <hr className="flex-grow" />
    {props.children}
  </div>
);
