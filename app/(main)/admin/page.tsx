import { getPendingDoctors, getVerifiedDoctors } from "@/actions/admin";
import { TabsContent } from "@/components/ui/tabs";
import PendingDoctors from "./_components/PendingDoctors";
import VerifiedDoctors from "./_components/VerifiedDoctors";

const AdminPage = async () => {
  const [pendingDoctors, verifiedDoctors] = await Promise.all([
    getPendingDoctors(),
    getVerifiedDoctors(),
  ]);

  return (
    <div className="col-span-3">
      <TabsContent value="pending">
        <PendingDoctors doctors={pendingDoctors.doctors || [] } />
      </TabsContent>
      <TabsContent value="doctors">
        <VerifiedDoctors doctors={verifiedDoctors.doctors || []} />
      </TabsContent>
    </div>
  );
};

export default AdminPage;
