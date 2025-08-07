import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import CreateApp from "../../new/page";
import BackAbleDialog from "./BackAbleDialog";

export default function InterceptingCreateApp() {
  return (
    <BackAbleDialog>
      <DialogContent>
        <DialogDescription className="hidden">create app</DialogDescription>
        <DialogTitle className="hidden">Create App</DialogTitle>
        <CreateApp></CreateApp>
      </DialogContent>
    </BackAbleDialog>
  );
}
