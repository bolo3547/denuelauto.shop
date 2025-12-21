import Head from 'next/head';

export default function SeoTags({title, description, image, url, jsonLd}:{title?:string, description?:string, image?:string, url?:string, jsonLd?:any}){
  return (<Head>
    {title && <title>{title}</title>}
    {description && <meta name="description" content={description} />}
    {image && <meta property="og:image" content={image} />}
    {url && <meta property="og:url" content={url} />}
    {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />}
  </Head>);
}
