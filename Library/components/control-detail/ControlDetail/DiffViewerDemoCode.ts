export const brokenReactCode = `"use client";

import { Button, Card, TextInput } from "opus-react";

type Customer = {
  id: string;
  name: string;
  company: string;
  status: "lead" | "active" | "paused";
};

type CustomerListProps = {
  customers: Customer[];
  onArchive: (customerId: string) => Promise<void>;
};

export function CustomerList({ customers, onArchive }: CustomerListProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visibleCustomers = customers.filter((customer) => {
    return customer.name.toLowerCase().includes(query.toLowerCase());
  });

  function toggleCustomer(customerId: string) {
    selectedIds.push(customerId);
    setSelectedIds(selectedIds);
  }

  async function archiveSelected() {
    selectedIds.forEach(async (customerId) => {
      await onArchive(customerId);
    });

    setSelectedIds([]);
  }

  return (
    <section>
      <header>
        <h2>Customers</h2>
        <Button onclick={archiveSelected}>
          Archive selected
        </Button>
      </header>

      <TextInput
        placeholder="Name, company or status"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div>
        {visibleCustomers.map((customer) => (
          <Card>
            <input
              type="checkbox"
              checked={selectedIds.includes(customer.id)}
              onChange={() => toggleCustomer(customer.id)}
            />
            <strong>{customer.name}</strong>
            <span>{customer.company}</span>
            <small>{customer.status}</small>
          </Card>
        ))}
      </div>
    </section>
  );
}`;

export const correctedReactCode = `"use client";

import { useMemo, useState } from "react";
import { Button, Card, Checkbox, TextInput } from "opus-react";

type Customer = {
  id: string;
  name: string;
  company: string;
  status: "lead" | "active" | "paused";
};

type CustomerListProps = {
  customers: Customer[];
  onArchive: (customerId: string) => Promise<void>;
};

export function CustomerList({ customers, onArchive }: CustomerListProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleCustomers = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.name, customer.company, customer.status]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [customers, query]);

  function toggleCustomer(customerId: string) {
    setSelectedIds((current) =>
      current.includes(customerId)
        ? current.filter((id) => id !== customerId)
        : [...current, customerId],
    );
  }

  async function archiveSelected() {
    setError(null);
    setIsArchiving(true);

    try {
      await Promise.all(
        selectedIds.map((customerId) => onArchive(customerId)),
      );
      setSelectedIds([]);
    } catch {
      setError("Some customers could not be archived. Please try again.");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <section aria-labelledby="customer-list-title">
      <header>
        <h2 id="customer-list-title">Customers</h2>
        <Button
          disabled={selectedIds.length === 0 || isArchiving}
          onClick={archiveSelected}
        >
          {isArchiving ? "Archiving…" : "Archive selected"}
        </Button>
      </header>

      <TextInput
        id="customer-search"
        label="Search customers"
        placeholder="Name, company or status"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {error ? <p role="alert">{error}</p> : null}

      <p role="status">
        Showing {visibleCustomers.length} of {customers.length} customers
      </p>

      <div aria-busy={isArchiving}>
        {visibleCustomers.map((customer) => (
          <Card key={customer.id}>
            <Checkbox
              aria-label={\`Select \${customer.name}\`}
              checked={selectedIds.includes(customer.id)}
              onChange={() => toggleCustomer(customer.id)}
            />
            <strong>{customer.name}</strong>
            <span>{customer.company}</span>
            <small>{customer.status}</small>
          </Card>
        ))}
      </div>
    </section>
  );
}`;
