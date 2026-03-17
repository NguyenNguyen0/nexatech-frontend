import Link from "next/link";

type PostPageProps = {
  params: {
    id: string;
  };
};

export default function Post({ params: { id } }: PostPageProps) {
  return (
    <div>
      <h3>Post #{id}</h3>
      <p>Lorem ipsum</p>
      <Link href="/blog">Back to blog</Link>
    </div>
  );
}
