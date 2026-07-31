"use client";

import { useState } from "react";
import { Key01 } from "@untitledui/icons";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { useCredentials } from "@/hooks/useCredentials";

export function CredentialsSettings() {
    const { credentials, updateCredentials } = useCredentials();
    const [gitlabToken, setGitlabToken] = useState("");
    const [jiraEmail, setJiraEmail] = useState("");
    const [jiraToken, setJiraToken] = useState("");

    return (
        <DialogTrigger
            onOpenChange={(isOpen) => {
                if (!isOpen) return;
                // Re-seed the form from storage on every open, in case credentials
                // were changed in another tab since this popover last closed.
                setGitlabToken(credentials.gitlabToken ?? "");
                setJiraEmail(credentials.jiraEmail ?? "");
                setJiraToken(credentials.jiraToken ?? "");
            }}
        >
            <ButtonUtility icon={Key01} tooltip="GitLab/Jira credentials" size="sm" color="tertiary" />

            <Popover placement="bottom end" className="w-80 rounded-lg bg-primary p-4 shadow-lg ring-1 ring-secondary_alt">
                <Dialog className="outline-hidden">
                    {({ close }) => (
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                updateCredentials({
                                    gitlabToken: gitlabToken.trim() || null,
                                    jiraEmail: jiraEmail.trim() || null,
                                    jiraToken: jiraToken.trim() || null,
                                });
                                close();
                            }}
                        >
                            <div>
                                <p className="text-sm font-semibold text-primary">GitLab/Jira credentials</p>
                                <p className="mt-1 text-xs text-tertiary">
                                    Stored only in this browser and sent only to your own GitLab/Jira instance — never shared with anyone else who opens this
                                    dashboard&apos;s link.
                                </p>
                            </div>

                            <Input label="GitLab access token" type="password" value={gitlabToken} onChange={setGitlabToken} placeholder="glpat-…" />
                            <Input label="Jira email" type="email" value={jiraEmail} onChange={setJiraEmail} placeholder="you@company.com" />
                            <Input label="Jira API token" type="password" value={jiraToken} onChange={setJiraToken} placeholder="ATATT…" />

                            <div className="flex justify-end gap-2">
                                <Button color="secondary" size="sm" type="button" onPress={close}>
                                    Cancel
                                </Button>
                                <Button color="primary" size="sm" type="submit">
                                    Save
                                </Button>
                            </div>
                        </form>
                    )}
                </Dialog>
            </Popover>
        </DialogTrigger>
    );
}
