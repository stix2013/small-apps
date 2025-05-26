export interface Button {
  text: string;
  url: string;
  // icon?: string | string[];
}

export interface IconButton extends Button {
  icon: string | string[]
  // text: string
  iconSize?: string
  iconClass?: string
}
