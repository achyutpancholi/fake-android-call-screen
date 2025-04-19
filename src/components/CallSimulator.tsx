import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import PhoneStyleSelector from './PhoneStyleSelector';
import androidRingtone from '@/assets/sounds/android-ringtone.mp3';
import iphoneRingtone from '@/assets/sounds/iphone-ringtone.mp3';

interface Contact {
  name: string;
  number: string;
}

interface CallScreenProps {
  contact: Contact;
  onEnd: () => void;
  phoneStyle: 'android' | 'iphone';
}

const CallScreen: React.FC<CallScreenProps> = ({ contact, onEnd, phoneStyle }) => {
  const [callTimer, setCallTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isActive) {
      intervalId = setInterval(() => {
        setCallTimer((timer) => timer + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = () => {
    setIsActive(true);
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const bgClass = phoneStyle === 'android' 
    ? 'from-gray-900 to-gray-800'
    : 'from-gray-800 via-gray-900 to-black';

  return (
    <div className={cn(
      "fixed inset-0 bg-gradient-to-b flex flex-col items-center justify-between p-8 text-white",
      bgClass
    )}>
      <audio
        ref={audioRef}
        src={phoneStyle === 'android' ? androidRingtone : iphoneRingtone}
        loop
      />
      <div className="flex flex-col items-center mt-12 space-y-4">
        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold">{contact.name}</h2>
        <p className="text-gray-300">{contact.number}</p>
        {isActive && (
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{formatTime(callTimer)}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-around w-full max-w-md mb-16">
        {!isActive ? (
          <>
            <button
              onClick={onEnd}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            <button
              onClick={handleAnswer}
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
            >
              <Phone className="w-8 h-8" />
            </button>
          </>
        ) : (
          <button
            onClick={onEnd}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
};

const CallSimulator: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('savedContacts');
    return saved ? JSON.parse(saved) : [];
  });
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [showCall, setShowCall] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [phoneStyle, setPhoneStyle] = useState<'android' | 'iphone'>('android');

  useEffect(() => {
    localStorage.setItem('savedContacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && number) {
      const newContact = { name, number };
      setContacts([...contacts, newContact]);
      setName('');
      setNumber('');
    }
  };

  const startCall = (contact: Contact) => {
    setCurrentContact(contact);
    setShowCall(true);
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500]);
    }
  };

  const endCall = () => {
    setShowCall(false);
    setCurrentContact(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {showCall && currentContact ? (
        <CallScreen 
          contact={currentContact} 
          onEnd={endCall} 
          phoneStyle={phoneStyle}
        />
      ) : (
        <div className="max-w-md mx-auto space-y-6">
          <form onSubmit={handleSaveContact} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">New Contact</h2>
            <PhoneStyleSelector value={phoneStyle} onChange={setPhoneStyle} />
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Number</label>
              <input
                type="tel"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Save Contact
            </button>
          </form>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Contacts</h2>
            <div className="space-y-3">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100"
                >
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.number}</p>
                  </div>
                  <button
                    onClick={() => startCall(contact)}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallSimulator;
