'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Trash2 } from 'lucide-react';

import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { NavigationFormData, NavigationFormProps } from '@/types';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  label: z.string().min(1, 'Nazwa jest wymagana'),
  url: z.string().url('Nieprawidłowy adres URL').optional().or(z.literal('')),
});

export function NavigationForm({ onSubmit, onCancel, initialData, className }: NavigationFormProps) {
  const form = useForm<NavigationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: '',
      url: '',
    },
  });

  return (
    <div className={cn('border-[1px] border-dark-border rounded-lg p-5 relative bg-white', className)}>
      <Form {...form}>
        <form data-testid="navigation-form" role="form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[95%]">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel aria-label="Nazwa">Nazwa</FormLabel>
                <FormControl>
                  <Input placeholder="np. Promocje" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel aria-label="Link">Link</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8" placeholder="Wklej lub wyszukaj" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 ">
            <Button aria-label="Anuluj" type="button" className="font-semibold" variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
            <Button
              aria-label="Dodaj pozycję menu"
              variant="outline"
              className="text-special border-special-border font-semibold"
              type="submit"
            >
              Dodaj
            </Button>
          </div>
        </form>
      </Form>
      <Trash2
        aria-label="Usuń"
        data-testid="trash-icon"
        onClick={onCancel}
        className="absolute right-4 top-4 md:right-8 md:top-6 h-5 w-5 text-black cursor-pointer"
      />
    </div>
  );
}
