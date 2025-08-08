interface UseFileDeleteProps {
  queryKey: {
    limit: number;
    orderBy: any;
    appId: string;
  };
  utils: any;
}

export function useFileDelete({ queryKey, utils }: UseFileDeleteProps) {
  const handleFileDelete = (id: string) => {
    utils.file.infinityQueryFiles.setInfiniteData({ ...queryKey }, (prev: any) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        pages: prev.pages.map((page: any) => {
          const hasId = page.items.some((item: any) => item.id === id);
          if (hasId) {
            return {
              ...page,
              items: page.items.filter((item: any) => item.id !== id),
            };
          }
          return page;
        }),
      };
    });
  };

  return {
    handleFileDelete,
  };
}
