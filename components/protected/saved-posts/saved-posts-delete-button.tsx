import { DeleteSavedPost } from '@/actions/delete-saved-post';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { savedPostConfig } from '@/config/saved-post';
import { toolbarConfig } from '@/config/toolbar';
import { supabase } from '@/utils/supabase-client';
import { Session } from '@supabase/auth-helpers-nextjs';
import { Loader2 as SpinnerIcon, Trash as TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SavedPostsDeleteButtonProps {
    id?: string;
}

const SavedPostsDeleteButton: React.FC<SavedPostsDeleteButtonProps> = ({ id }) => {
    const router = useRouter();
    const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    const [session, setSession] = React.useState<Session | null>(null);

    // Check authentitication and bookmark states
    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [id, session?.user.id]);

    // Delete saved post
    async function deleteSavedPost() {
        setIsDeleteLoading(true);
        if (id && session?.user.id) {
            const savedPostData = {
                id: id,
                user_id: session?.user.id,
            };
            const response = await DeleteSavedPost(savedPostData);
            if (response) {
                setIsDeleteLoading(false);
                toast.success(savedPostConfig.deleted);
                router.refresh();
            } else {
                setIsDeleteLoading(false);
                toast.error(savedPostConfig.errorDelete);
            }
        } else {
            setIsDeleteLoading(false);
            toast.error(savedPostConfig.errorDelete);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setShowDeleteAlert(true)}
                className="rounded-md border bg-gray-50 px-3 py-2 text-gray-900 hover:bg-gray-100"
            >
                {savedPostConfig.delete}
            </button>
            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent className="text-md font-sans">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{savedPostConfig.question}</AlertDialogTitle>
                        <AlertDialogDescription>{savedPostConfig.warning}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{savedPostConfig.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteSavedPost}>
                            {isDeleteLoading ? (
                                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <TrashIcon className="mr-2 h-4 w-4" />
                            )}
                            <span>{savedPostConfig.confirm}</span>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default SavedPostsDeleteButton;
