import { cn } from "@acme/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import { ScrollArea } from "@acme/ui/scroll-area";
import { Separator } from "@acme/ui/separator";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  ImagePlus,
  MessagesSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Search as SearchIcon,
  Send,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import { NewChat } from "./components/new-chat";
import type { ChatUser, Convo } from "./data/chat-types";
// Fake Data
import { conversations } from "./data/convo.json";

export function Chats() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [mobileSelectedUser, setMobileSelectedUser] = useState<ChatUser | null>(
    null
  );
  const [createConversationDialogOpened, setCreateConversationDialog] =
    useState(false);

  // Filtered data based on the search query
  const filteredChatList = conversations.filter(({ fullName }) =>
    fullName.toLowerCase().includes(search.trim().toLowerCase())
  );

  const currentMessage = selectedUser?.messages.reduce(
    (acc: Record<string, Convo[]>, obj) => {
      const key = format(obj.timestamp, "d MMM, yyyy");

      // Create an array for the category if it doesn't exist
      if (!acc[key]) {
        acc[key] = [];
      }

      // Push the current object to the array
      acc[key].push(obj);

      return acc;
    },
    {}
  );

  const users = conversations.map(({ messages, ...user }) => user);

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <section className="flex h-full gap-6">
          {/* Left Side */}
          <div className="flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80">
            <div className="sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none">
              <div className="flex items-center justify-between py-2">
                <div className="flex gap-2">
                  <h1 className="font-bold text-2xl">Inbox</h1>
                  <MessagesSquare size={20} />
                </div>

                <Button
                  className="rounded-lg"
                  onClick={() => setCreateConversationDialog(true)}
                  size="icon"
                  variant="ghost"
                >
                  <Edit className="stroke-muted-foreground" size={24} />
                </Button>
              </div>

              <label
                className={cn(
                  "focus-within:outline-hidden focus-within:ring-1 focus-within:ring-ring",
                  "flex h-10 w-full items-center space-x-0 rounded-md border border-border ps-2"
                )}
              >
                <SearchIcon className="me-2 stroke-slate-500" size={15} />
                <span className="sr-only">Search</span>
                <input
                  className="w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chat..."
                  type="text"
                  value={search}
                />
              </label>
            </div>

            <ScrollArea className="-mx-3 h-full overflow-scroll p-3">
              {filteredChatList.map((chatUsr) => {
                const { id, profile, username, messages, fullName } = chatUsr;
                const lastConvo = messages[0];
                const lastMsg =
                  lastConvo.sender === "You"
                    ? `You: ${lastConvo.message}`
                    : lastConvo.message;
                return (
                  <Fragment key={id}>
                    <button
                      className={cn(
                        "group hover:bg-accent hover:text-accent-foreground",
                        "flex w-full rounded-md px-2 py-2 text-start text-sm",
                        selectedUser?.id === id && "sm:bg-muted"
                      )}
                      onClick={() => {
                        setSelectedUser(chatUsr);
                        setMobileSelectedUser(chatUsr);
                      }}
                      type="button"
                    >
                      <div className="flex gap-2">
                        <Avatar>
                          <AvatarImage alt={username} src={profile} />
                          <AvatarFallback>{username}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="col-start-2 row-span-2 font-medium">
                            {fullName}
                          </span>
                          <span className="col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground group-hover:text-accent-foreground/90">
                            {lastMsg}
                          </span>
                        </div>
                      </div>
                    </button>
                    <Separator className="my-1" />
                  </Fragment>
                );
              })}
            </ScrollArea>
          </div>

          {/* Right Side */}
          {selectedUser ? (
            <div
              className={cn(
                "absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border bg-background shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md",
                mobileSelectedUser && "start-0 flex"
              )}
            >
              {/* Top Part */}
              <div className="mb-1 flex flex-none justify-between bg-card p-4 shadow-lg sm:rounded-t-md">
                {/* Left */}
                <div className="flex gap-3">
                  <Button
                    className="-ms-2 h-full sm:hidden"
                    onClick={() => setMobileSelectedUser(null)}
                    size="icon"
                    variant="ghost"
                  >
                    <ArrowLeft className="rtl:rotate-180" />
                  </Button>
                  <div className="flex items-center gap-2 lg:gap-4">
                    <Avatar className="size-9 lg:size-11">
                      <AvatarImage
                        alt={selectedUser.username}
                        src={selectedUser.profile}
                      />
                      <AvatarFallback>{selectedUser.username}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="col-start-2 row-span-2 font-medium text-sm lg:text-base">
                        {selectedUser.fullName}
                      </span>
                      <span className="col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-ellipsis text-nowrap text-muted-foreground text-xs lg:max-w-none lg:text-sm">
                        {selectedUser.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="-me-1 flex items-center gap-1 lg:gap-2">
                  <Button
                    className="hidden size-8 rounded-full sm:inline-flex lg:size-10"
                    size="icon"
                    variant="ghost"
                  >
                    <Video className="stroke-muted-foreground" size={22} />
                  </Button>
                  <Button
                    className="hidden size-8 rounded-full sm:inline-flex lg:size-10"
                    size="icon"
                    variant="ghost"
                  >
                    <Phone className="stroke-muted-foreground" size={22} />
                  </Button>
                  <Button
                    className="h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6"
                    size="icon"
                    variant="ghost"
                  >
                    <MoreVertical className="stroke-muted-foreground sm:size-5" />
                  </Button>
                </div>
              </div>

              {/* Conversation */}
              <div className="flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4">
                <div className="flex size-full flex-1">
                  <div className="chat-text-container relative -me-4 flex flex-1 flex-col overflow-y-hidden">
                    <div className="chat-flex flex h-40 w-full grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pe-4 pb-4">
                      {currentMessage &&
                        Object.keys(currentMessage).map((key) => (
                          <Fragment key={key}>
                            {currentMessage[key].map((msg, index) => (
                              <div
                                className={cn(
                                  "chat-box max-w-72 break-words px-3 py-2 shadow-lg",
                                  msg.sender === "You"
                                    ? "self-end rounded-[16px_16px_0_16px] bg-primary/90 text-primary-foreground/75"
                                    : "self-start rounded-[16px_16px_16px_0] bg-muted"
                                )}
                                key={`${msg.sender}-${msg.timestamp}-${index}`}
                              >
                                {msg.message}{" "}
                                <span
                                  className={cn(
                                    "mt-1 block font-light text-foreground/75 text-xs italic",
                                    msg.sender === "You" &&
                                      "text-end text-primary-foreground/85"
                                  )}
                                >
                                  {format(msg.timestamp, "h:mm a")}
                                </span>
                              </div>
                            ))}
                            <div className="text-center text-xs">{key}</div>
                          </Fragment>
                        ))}
                    </div>
                  </div>
                </div>
                <form className="flex w-full flex-none gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-card px-2 py-1 focus-within:outline-hidden focus-within:ring-1 focus-within:ring-ring lg:gap-4">
                    <div className="space-x-1">
                      <Button
                        className="h-8 rounded-md"
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Plus className="stroke-muted-foreground" size={20} />
                      </Button>
                      <Button
                        className="hidden h-8 rounded-md lg:inline-flex"
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <ImagePlus
                          className="stroke-muted-foreground"
                          size={20}
                        />
                      </Button>
                      <Button
                        className="hidden h-8 rounded-md lg:inline-flex"
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Paperclip
                          className="stroke-muted-foreground"
                          size={20}
                        />
                      </Button>
                    </div>
                    <label className="flex-1">
                      <span className="sr-only">Chat Text Box</span>
                      <input
                        className="h-8 w-full bg-inherit focus-visible:outline-hidden"
                        placeholder="Type your messages..."
                        type="text"
                      />
                    </label>
                    <Button
                      className="hidden sm:inline-flex"
                      size="icon"
                      variant="ghost"
                    >
                      <Send size={20} />
                    </Button>
                  </div>
                  <Button className="h-full sm:hidden">
                    <Send size={18} /> Send
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border bg-card shadow-xs sm:static sm:z-auto sm:flex"
              )}
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="flex size-16 items-center justify-center rounded-full border-2 border-border">
                  <MessagesSquare className="size-8" />
                </div>
                <div className="space-y-2 text-center">
                  <h1 className="font-semibold text-xl">Your messages</h1>
                  <p className="text-muted-foreground text-sm">
                    Send a message to start a chat.
                  </p>
                </div>
                <Button onClick={() => setCreateConversationDialog(true)}>
                  Send message
                </Button>
              </div>
            </div>
          )}
        </section>
        <NewChat
          onOpenChange={setCreateConversationDialog}
          open={createConversationDialogOpened}
          users={users}
        />
      </Main>
    </>
  );
}
