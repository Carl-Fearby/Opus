"use client";
import {useState} from "react";import {Button,InfiniteSelectableList,VirtualList,MentionInputField,TimeRangeField,RecurrenceEditor,SignaturePad,DiffViewer,ProductTour,type ProductTourStep,type RecurrenceValue} from "opus-react";import styles from "./NewComponentPreviews.module.css";
import { brokenReactCode, correctedReactCode } from "./DiffViewerDemoCode";
const activityPeople = ["Emma Davis", "Michael Brown", "Olivia Wilson", "Noah Patel", "Sophia Carter", "James Smith"];
const activityCompanies = ["Acme Ltd", "Initech", "Global Corp", "Northstar", "Vertex Labs", "Summit Group"];
const activityMessages = ["Opened the enterprise proposal", "Moved a deal to negotiation", "Scheduled a discovery call", "Added notes to the account", "Uploaded a signed agreement", "Requested a pricing review"];
export function VirtualListPreview({hasMore=true,totalItemCount}:{hasMore?:boolean;totalItemCount?:number}){const [loadedCount,setLoadedCount]=useState(20);const items=Array.from({length:loadedCount},(_,index)=>({id:index,name:activityPeople[index%activityPeople.length],company:activityCompanies[(index*3)%activityCompanies.length],message:activityMessages[(index*5)%activityMessages.length],time:index<2?"Just now":`${(index%58)+2}m ago`,unread:index%4===0}));const canLoadMore=hasMore&&(totalItemCount===undefined||loadedCount<totalItemCount);return <VirtualList items={items} height={400} itemHeight={80} hasMore={canLoadMore} totalItemCount={totalItemCount} loadMoreThreshold={4} onLoadMore={()=>setLoadedCount((count)=>Math.min(totalItemCount??Number.POSITIVE_INFINITY,count+20))} getKey={(item)=>item.id} renderItem={(item)=><div className={styles.activityRow}><span aria-hidden="true" className={styles.activityAvatar}>{item.name.split(" ").map((part)=>part[0]).join("")}</span><div className={styles.activityCopy}><strong>{item.name}</strong><span>{item.message}</span><small>{item.company}</small></div><span className={styles.activityMeta}>{item.unread?<i aria-label="Unread"/>:null}<time>{item.time}</time></span></div>} onItemClick={()=>undefined}/>}
const mailSubjects = ["Quarterly pipeline review", "Signed agreement ready", "Tomorrow's customer workshop", "Updated implementation plan", "Pricing approval required", "Notes from our discovery call"];
const mailPreviews = ["I've added the latest figures and comments for the team…", "The completed document is attached for your records…", "Here is the agenda and the final list of attendees…", "We've incorporated the dependencies discussed yesterday…", "Could you review the revised commercial terms today?", "Thanks for the conversation — these are the agreed actions…"];
function createMailItems(count:number,start=0){return Array.from({length:count},(_,offset)=>{const index=start+offset;return {id:`mail-${index}`,sender:activityPeople[index%activityPeople.length],subject:mailSubjects[(index*3)%mailSubjects.length],preview:mailPreviews[(index*5)%mailPreviews.length],time:index<2?"Just now":`${(index%58)+2}m`,unread:index%4===0,flagged:index%7===0};});}
export function InfiniteSelectableListPreview({hasMore=true,selectionIndicator="none",totalItemCount,onAction}:{hasMore?:boolean;selectionIndicator?:"none"|"checkbox"|"radio";totalItemCount?:number;onAction?:(label:string,data:Record<string,unknown>)=>void}){const loadLimit=totalItemCount??5000;const [items,setItems]=useState(()=>createMailItems(30));const [selectedIds,setSelectedIds]=useState<string[]>([]);return <InfiniteSelectableList ariaLabel="Inbox messages" items={items} height={440} itemHeight={76} totalItemCount={hasMore?totalItemCount:items.length} hasMore={hasMore&&items.length<loadLimit} selectedIds={selectedIds} selectionIndicator={selectionIndicator} getItemId={(item)=>item.id} onSelectionChange={(ids,context)=>{setSelectedIds(ids);onAction?.(`Selected ${ids.length} message${ids.length===1?"":"s"}`,{selectedIds:ids,selectedMessages:context.selectedItems,focusedId:context.focusedId,reason:context.reason});}} onLoadMore={()=>setItems((current)=>{const next=[...current,...createMailItems(Math.min(20,loadLimit-current.length),current.length)];onAction?.("Loaded more messages",{loadedCount:next.length,totalItemCount:totalItemCount??null});return next;})} onItemActivate={(item)=>onAction?.(`Opened ${item.subject}`,{message:item})} renderItem={(item)=><article className={styles.mailRow} data-unread={item.unread||undefined}><div className={styles.mailCopy}><strong>{item.sender}</strong><span>{item.subject}</span><small>{item.preview}</small></div><span className={styles.mailMeta}>{item.flagged?<b aria-label="Flagged">◆</b>:null}<time>{item.time}</time></span></article>}/>}
export function MentionInputPreview(){const [value,setValue]=useState("Discuss this with @");return <MentionInputField id="mention" label="Comment" value={value} options={[{id:"1",label:"Emma Davis",description:"Procurement"},{id:"2",label:"Michael Brown",description:"Sales"},{id:"3",label:"Olivia Wilson",description:"Operations"}]} onChange={setValue} onMention={()=>undefined}/>}
export function TimeRangePreview(){const [value,setValue]=useState({start:"09:00",end:"17:30"});return <TimeRangeField id="hours" label="Working hours" value={value} onChange={setValue}/>}
export function RecurrencePreview(){const [value,setValue]=useState<RecurrenceValue>({frequency:"weekly",interval:1,weekdays:[1,3,5],ends:"never"});return <RecurrenceEditor value={value} onChange={setValue}/>}
export function SignaturePreview(){return <SignaturePad onChange={()=>undefined} onClear={()=>undefined}/>}
const originalCode=`"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, TextField } from "opus-react";

type Customer = {
  id: string;
  name: string;
  company: string;
  status: "lead" | "active" | "paused";
};

type CustomerWorkspaceProps = {
  initialCustomers: Customer[];
  onOpenCustomer: (customer: Customer) => void;
};

export function CustomerWorkspace({
  initialCustomers,
  onOpenCustomer,
}: CustomerWorkspaceProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
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

  useEffect(() => {
    if (!filteredCustomers.some(({ id }) => id === selectedId)) {
      setSelectedId(filteredCustomers[0]?.id ?? null);
    }
  }, [filteredCustomers, selectedId]);

  function archiveCustomer(customerId: string) {
    setCustomers((current) =>
      current.filter((customer) => customer.id !== customerId),
    );
  }

  return (
    <section aria-labelledby="customer-workspace-title">
      <header>
        <div>
          <p>CRM workspace</p>
          <h1 id="customer-workspace-title">Customers</h1>
        </div>
        <Button onClick={() => console.log("Create customer")}>
          Add customer
        </Button>
      </header>

      <TextField
        id="customer-search"
        label="Search customers"
        placeholder="Name, company or status"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div aria-live="polite">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <button
              aria-pressed={selectedId === customer.id}
              type="button"
              onClick={() => setSelectedId(customer.id)}
            >
              <strong>{customer.name}</strong>
              <span>{customer.company}</span>
              <small>{customer.status}</small>
            </button>
            <Button onClick={() => onOpenCustomer(customer)}>Open</Button>
            <Button onClick={() => archiveCustomer(customer.id)}>
              Archive
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}`;
const changedCode=originalCode
  .replace('import { Button, Card, TextField } from "opus-react";', 'import { Alert, Button, Card, Spinner, TextField } from "opus-react";')
  .replace('  const [selectedId, setSelectedId] = useState<string | null>(null);', '  const [selectedId, setSelectedId] = useState<string | null>(null);\n  const [isSaving, setIsSaving] = useState(false);\n  const [error, setError] = useState<string | null>(null);')
  .replace('  function archiveCustomer(customerId: string) {\n    setCustomers((current) =>\n      current.filter((customer) => customer.id !== customerId),\n    );\n  }', '  async function archiveCustomer(customerId: string) {\n    const snapshot = customers;\n    setError(null);\n    setIsSaving(true);\n    setCustomers((current) =>\n      current.filter((customer) => customer.id !== customerId),\n    );\n\n    try {\n      await fetch(`/api/customers/${customerId}`, { method: "DELETE" });\n    } catch {\n      setCustomers(snapshot);\n      setError("The customer could not be archived. Your changes were restored.");\n    } finally {\n      setIsSaving(false);\n    }\n  }')
  .replace('      <TextField', '      {error ? <Alert status="error">{error}</Alert> : null}\n      {isSaving ? <Spinner label="Saving customer changes" /> : null}\n\n      <TextField')
  .replace('      <div aria-live="polite">', '      <p role="status">\n        Showing {filteredCustomers.length} of {customers.length} customers\n      </p>\n\n      <div aria-busy={isSaving} aria-live="polite">')
  .replace('            <Button onClick={() => archiveCustomer(customer.id)}>', '            <Button\n              disabled={isSaving}\n              variant="danger"\n              onClick={() => archiveCustomer(customer.id)}\n            >');
export function DiffPreview() {
  return <DiffViewer before={brokenReactCode} after={correctedReactCode} beforeLabel="Original code" afterLabel="Corrected code" />;
}
const catalogueTourSteps: ProductTourStep[] = [
  {id:"navigation",target:'[data-opus-tour="top-navigation"]',fallbackTarget:"#create-tour",title:"Navigate the documentation",description:"Move between the guide, component catalogue, playground, and release history.",placement:"bottom"},
  {id:"ui-font",target:'[data-opus-tour="ui-font"]',fallbackTarget:"#create-tour",title:"Choose the UI font",description:"Select the typeface used by the catalogue shell and its documentation.",placement:"bottom"},
  {id:"ui-theme",target:'[data-opus-tour="ui-theme"]',fallbackTarget:"#create-tour",title:"Switch the UI theme",description:"Toggle the catalogue shell between light and dark mode independently of the component preview.",placement:"bottom"},
  {id:"ui-colours",target:'[data-opus-tour="ui-colours"]',fallbackTarget:"#create-tour",title:"Customise the catalogue colours",description:"Set the Base, Accent, and Secondary Accent colours used throughout the documentation UI.",placement:"bottom"},
  {id:"navigation-resize",target:'[data-opus-tour="navigation-resize"]',fallbackTarget:"#create-tour",title:"Resize the catalogue navigation",description:"Drag this bar, or focus it and use the arrow keys, to change the navigation width.",placement:"right"},
  {id:"catalogue",target:'[data-opus-tour="component-navigation"]',fallbackTarget:"#create-tour",title:"Browse the component catalogue",description:"Search or expand a category to find every Opus primitive, pattern, and lab.",placement:"right"},
  {id:"heading",target:'[data-opus-tour="component-heading"]',fallbackTarget:"#create-tour",title:"Understand the component",description:"The page heading identifies the component and summarises its intended role.",placement:"bottom"},
  {id:"preview",target:'[data-opus-tour="component-preview"]',fallbackTarget:"#create-tour",title:"Try the live preview",description:"Interact with the rendered component and open the same example in Playground or External view.",placement:"bottom"},
  {id:"preview-appearance",target:'[data-opus-tour="preview-appearance"]',fallbackTarget:"#create-tour",title:"Style only the component preview",description:"These Base, Accent, Secondary Accent, font, and theme controls are isolated from the catalogue UI.",placement:"bottom"},
  {id:"settings-resize",target:'[data-opus-tour="settings-resize"]',fallbackTarget:"#create-tour",title:"Resize the settings panel",description:"Drag this bar, or use it from the keyboard, to give component settings more or less room.",placement:"left"},
  {id:"settings",target:'[data-opus-tour="component-settings"]',fallbackTarget:"#create-tour",title:"Adjust component settings",description:"Change supported props here and see the preview and generated usage update together.",placement:"left"},
  {id:"documentation",target:'[data-opus-tour="component-documentation"]',fallbackTarget:"#create-tour",title:"Read the documentation",description:"Review usage guidance, props, accessibility behaviour, and composition relationships.",placement:"top"},
  {id:"usage",target:'[data-opus-tour="component-usage"]',fallbackTarget:"#create-tour",title:"Copy production-ready usage",description:"Copy the complete example or send it to Playground to adapt it for your application.",placement:"top"},
];
export function ProductTourPreview(){const [open,setOpen]=useState(false);return <div><Button id="create-tour" onClick={()=>setOpen(true)}>Create a tour</Button><ProductTour open={open} steps={catalogueTourSteps} onDismiss={()=>setOpen(false)} onComplete={()=>setOpen(false)}/></div>}
