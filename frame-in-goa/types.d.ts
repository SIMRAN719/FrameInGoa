declare module "heic2any" {
  type Options = { blob: Blob; toType?: string; quality?: number; multiple?: boolean };
  const heic2any: (options: Options) => Promise<Blob | Blob[]>;
  export default heic2any;
}
