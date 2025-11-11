'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function FixTimestampsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<string[]>([]);

  const fixTimestamps = async () => {
    if (!firestore || !user) {
      setStatus('error');
      setMessage('Not authenticated or Firestore not initialized');
      return;
    }

    setStatus('loading');
    setMessage('Checking playlists...');
    setDetails([]);

    try {
      // Get all playlists
      const snapshot = await getDocs(collection(firestore, 'playlists'));
      
      if (snapshot.empty) {
        setStatus('error');
        setMessage('No playlists found in database');
        return;
      }

      const batch = writeBatch(firestore);
      const now = new Date();
      let updateCount = 0;
      const logs: string[] = [];

      logs.push(`Found ${snapshot.size} playlists`);

      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        
        const missingCreatedAt = !data.createdAt;
        const missingUpdatedAt = !data.updatedAt;
        
        if (missingCreatedAt || missingUpdatedAt) {
          const updateData: any = {};
          
          // Only update fields that are actually missing
          if (missingCreatedAt) {
            updateData.createdAt = now;
          }
          if (missingUpdatedAt) {
            updateData.updatedAt = now;
          }
          
          logs.push(`✅ Updating: ${data.name || docSnapshot.id} (missing: ${missingCreatedAt ? 'createdAt' : ''}${missingCreatedAt && missingUpdatedAt ? ', ' : ''}${missingUpdatedAt ? 'updatedAt' : ''})`);
          
          batch.update(doc(firestore, 'playlists', docSnapshot.id), updateData);
          
          updateCount++;
        } else {
          logs.push(`⏭️ Skipping: ${data.name || docSnapshot.id} (already has timestamps)`);
        }
      });

      if (updateCount === 0) {
        setStatus('success');
        setMessage('All playlists already have timestamps!');
        setDetails(logs);
        return;
      }

      logs.push(`Updating ${updateCount} playlists...`);
      await batch.commit();
      
      logs.push('✅ Migration complete!');
      logs.push('🔄 Refresh dashboard to see playlists');
      
      setStatus('success');
      setMessage(`Successfully updated ${updateCount} playlists!`);
      setDetails(logs);
      
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);
      setDetails([error.toString()]);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please login to access this page
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Fix Playlist Timestamps</CardTitle>
          <CardDescription>
            Add missing createdAt and updatedAt timestamps to playlists
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This tool will add createdAt and updatedAt timestamps to any playlists that are missing them.
              This is required for the dashboard to display playlists correctly.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={fixTimestamps} 
            disabled={status === 'loading'}
            className="w-full"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Fix Timestamps Now'
            )}
          </Button>

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {details.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm">Details:</p>
              {details.map((detail, i) => (
                <p key={i} className="text-sm font-mono">{detail}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

