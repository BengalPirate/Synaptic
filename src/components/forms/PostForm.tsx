
import * as z from "zod";
//import { Models } from "appwrite";
import { useForm } from "react-hook-form";
//import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
} from "@/components/ui/form";
import { button } from "@/components/ui/button";
//import { PostValidation } from "@/lib/validation";
//import { useToast } from "@/components/ui/use-toast";
//import { useUserContext } from "@/context/AuthContext";
import { 
    FileUploader, 
    //Loader 
} from "@/components/shared/FileUploader";
//import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";


const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
})

const PostForm = () => {
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // This will be type-safe and validated.
        console.log(values)
    }

    return (
        <form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-9 w-full max-w-5xl">
                <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Caption</FormLabel>
                            <FormControl>
                                <Textarea className="shad-textarea custom-scrollbar" {...field}/>
                            </FormControl>
                            <FormMessage className="shad-form_message"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Photos</FormLabel>
                            <FormControl>
                                <FileUploader/>
                            </FormControl>
                            <FormMessage className="shad-form_message"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Location</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input"/>
                            </FormControl>
                            <FormMessage className="shad-form_message"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Tags (separated by comma " , ")</FormLabel>
                            <FormControl>
                                <Input 
                                    type="text" 
                                    className="shad-input"
                                    placeholder="Art, Expression, Learn"
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message"/>
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 items-center justify-end">
                    <Button 
                        type="button" 
                        className="shad-button_dark_4"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        className="shad-button_primary whitespace-nowrap"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        </form>
    )
}

export default PostForm
