/** Parent panel mock */
export function useParentMock(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "1"
  );
}

/** Bola panel mock — USE_CHILD_MOCK=false bo'lsa API */
export function useChildMock(): boolean {
  const childFlag = process.env.NEXT_PUBLIC_USE_CHILD_MOCK;
  if (childFlag === "false") return false;
  if (childFlag === "true" || childFlag === "1") return true;
  return useParentMock();
}
