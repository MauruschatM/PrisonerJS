"use client";

import Form from 'next/form'
import { createTournament } from '@/server/lib/actions';
import { Button } from '@heroui/button';
import { redirect } from 'next/navigation'

async function handleCreateTournament(formData: FormData): Promise<void> {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    // You can add more fields as needed
    await createTournament(name, description);
    redirect('/tournaments'); // Redirect to the tournaments page after creation
}

export default function CreateNewTournament() {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Create New Tournament</h2>
            <Form action={handleCreateTournament} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tournament Name</label>
                    <input type="text" id="name" name="name" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" name="description" rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
                <Button type="submit" >Create Tournament</Button>
            </Form>
        </div>
    );
}