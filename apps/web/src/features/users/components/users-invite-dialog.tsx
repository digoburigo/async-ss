import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { Textarea } from "@acme/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailPlus, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SelectDropdown } from "~/components/select-dropdown";
import { showSubmittedData } from "~/lib/show-submitted-data";
import { roles } from "../data/data";

const formSchema = z.object({
  email: z.email({
    error: (iss) =>
      iss.input === "" ? "Please enter an email to invite." : undefined,
  }),
  role: z.string().min(1, "Role is required."),
  desc: z.string().optional(),
});

type UserInviteForm = z.infer<typeof formSchema>;

type UserInviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UsersInviteDialog({
  open,
  onOpenChange,
}: UserInviteDialogProps) {
  const form = useForm<UserInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", role: "", desc: "" },
  });

  const onSubmit = (values: UserInviteForm) => {
    form.reset();
    showSubmittedData(values);
    onOpenChange(false);
  };

  return (
    <Dialog
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <MailPlus /> Invite User
          </DialogTitle>
          <DialogDescription>
            Invite new user to join your team by sending them an email
            invitation. Assign a role to define their access level.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            id="user-invite-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg: john.doe@gmail.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    items={roles.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                    onValueChange={field.onChange}
                    placeholder="Select a role"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Add a personal note to your invitation (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="gap-y-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button form="user-invite-form" type="submit">
            Invite <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
