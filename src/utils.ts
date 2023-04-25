const removeRedundantChar = (value: string): string => {
  return value.replace(/^("|'|`|\s)/g, '');
};

const cond = (item: any) => {
  let _item_$match, _item_$match$length, _item_$match2;

  const item_ = removeRedundantChar(item);
  return (
    ((_item_$match = item_.match(/\(|\)/g)) == null ? void 0 : _item_$match.length) != null &&
    ((_item_$match$length =
      (_item_$match2 = item_.match(/\(|\)/g)) == null ? void 0 : _item_$match2.length) != null
      ? _item_$match$length
      : 0) %
      2 !==
      0
  );
};

const removeDuplicate = (arr: string[]): string[] => {
  return Array.from(new Set(arr));
};

export const getClassNames = (value: string): string[] => {
  const regexp =
    /className=(\"|\'|\`|\\s|\{)[a-zA-Z0-9\:\;\.\s\(\)\-\,\_\'\"\=\+\{\[\%\}\]\`\$\?\<\>\!\|\&]*(\"|\'|\`|\\s|\})/g;

  const classNames = [].concat(
    [],
    ((value.match(regexp) || []) as any[]).reduce(function (arr: any, item: any) {
      if (cond(item)) {
        return arr;
      }

      let newItem = removeRedundantChar(item);

      //@ts-ignore
      return [].concat(arr, [newItem]);
    }, []),
  );

  return removeDuplicate([].concat(classNames)) as string[];
};
