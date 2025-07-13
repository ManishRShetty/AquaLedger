"use client";

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { logNewCatch } from "@/app/actions";
import { CatchContext } from "@/context/CatchContext";
import type { CatchResult } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  species: z.string().min(2, {
    message: "Species must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  date: z.date({
    required_error: "A date of catch is required.",
  }),
  method: z.string().min(2, {
    message: "Method must be at least 2 characters.",
  }),
});

export function CatchForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CatchResult | null>(null);
  const { toast } = useToast();
  const context = useContext(CatchContext);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      species: "",
      location: "",
      method: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    const catchData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
    };

    const response = await logNewCatch(catchData);

    if ("error" in response) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: response.error,
      });
    } else {
      setResult(response);
      if (context) {
        context.addCatch(response);
      }
      toast({
        title: "Success!",
        description: "Your catch has been logged and scored.",
      });
      form.reset();
    }
    setIsLoading(false);
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };


  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Atlantic Cod" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. North Sea" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Catch</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catch Method</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Longline" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating Score...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Sustainability Score
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <Card className="bg-accent/30 border-primary/50">
            <CardHeader>
              <CardTitle className="text-2xl">Sustainability Score</CardTitle>
              <CardDescription>
                Based on the provided catch details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                 <p className={cn("text-7xl font-bold", getScoreColor(result.score))}>{result.score}</p>
                 <p className="text-muted-foreground">out of 100</p>
              </div>
              <Progress value={result.score} className="h-3 [&>div]:bg-primary"/>

              <div>
                <h4 className="font-semibold mb-2">Rationale:</h4>
                <p className="text-sm text-foreground/80">{result.rationale}</p>
              </div>
               <Button onClick={() => router.push(`/catch/${result.id}`)} className="w-full">
                View Full Traceability Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
}
