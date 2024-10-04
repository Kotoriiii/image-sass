import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import CreateApp from "../../new/page";
import BackableDialog from "./BackableDialog";

export default function InterceptingCreateApp() {
  return (
    <BackableDialog>
      <DialogContent>
        <DialogDescription className="hidden">create app</DialogDescription>
        <DialogTitle className="hidden">Create App</DialogTitle>
        <CreateApp></CreateApp>
      </DialogContent>
    </BackableDialog>
  );
}
