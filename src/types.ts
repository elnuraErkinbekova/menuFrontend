export type Banner = {
  id: number;
  img: string;
  title?: string;
};

export type Category = {
  id: number | string;
  name_en?: string;
  name_ru?: string;
  name_ky?: string;
  img?: string;
};

export type Item = {
  id: number | string;
  title: string;
  description?: string;
  ingredients?: string;
  price?: string | number;
  img?: string;
};
