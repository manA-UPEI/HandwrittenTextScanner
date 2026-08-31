import { auth, signIn, signOut } from "@/auth";
import { transcribeImageAction } from "@/presentation/actions/transcribe-image.action";
import {
  deleteDocumentAction,
  listDocumentsAction,
  loadDocumentAction,
  saveDocumentAction,
} from "@/presentation/actions/documents.action";
import { ScannerScreen } from "@/presentation/components/scanner-screen";
import { Button } from "@/presentation/components/ui/button";

const documentActions = {
  save: saveDocumentAction,
  list: listDocumentsAction,
  load: loadDocumentAction,
  remove: deleteDocumentAction,
};

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Handwriting Scanner</h1>
        <p className="text-sm text-slate-600">
          Sign in to scan handwritten pages, save your progress, and export them as a PDF.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <Button type="submit">Sign in with Google</Button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-4 text-sm text-slate-600">
        <span>{session.user.email}</span>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit" className="underline hover:no-underline">
            Sign out
          </button>
        </form>
      </div>
      <ScannerScreen transcribe={transcribeImageAction} documentActions={documentActions} />
    </>
  );
}
