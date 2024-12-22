import { titleCase } from 'title-case';

const displayCase = (text: string) => {
  return titleCase(text.toLowerCase());
};

export { displayCase };
