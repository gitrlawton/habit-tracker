import { SharePageContent } from './share-page-content';

export default function SharePage({
  params,
}: {
  params: { code: string };
}) {
  return <SharePageContent code={params.code} />;
}
