import { BookForm } from "@/components/book-form/form";

export default function BookPage() {
  return (
    <div>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Nouvelle réservation
      </h2>
      <BookForm />
    </div>
  );
}
