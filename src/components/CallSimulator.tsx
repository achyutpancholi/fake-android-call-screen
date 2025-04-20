import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, User, Clock, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider";
import PhoneStyleSelector from './PhoneStyleSelector';
import androidRingtone from '@/assets/sounds/android-ringtone.mp3';
import iphoneRingtone from '@/assets/sounds/iphone-ringtone.mp3';
import { toast } from "@/hooks/use-toast";

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
  const [sliderValue, setSliderValue] = useState([0]);
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

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    if (value[0] === 100) {
      handleAnswer();
    } else if (value[0] === 0) {
      onEnd();
    }
  };

  const styles = {
    android: {
      container: "fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800",
      avatar: "w-24 h-24 rounded-full bg-blue-500",
      button: "w-16 h-16 rounded-full",
      name: "text-2xl font-bold text-white",
      number: "text-gray-300",
      timer: "text-gray-300",
    },
    iphone: {
      container: "fixed inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black",
      avatar: "w-24 h-24 rounded-full bg-gray-600",
      button: "w-16 h-16 rounded-full backdrop-blur-md bg-white/10",
      name: "text-3xl font-semibold text-white",
      number: "text-gray-400 text-lg",
      timer: "text-gray-400",
      slider: "relative w-64 h-14 bg-white/10 rounded-full backdrop-blur-md",
      sliderTrack: "h-14 bg-green-500/20",
      sliderThumb: "block h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center"
    }
  };

  const currentStyle = styles[phoneStyle];

  return (
    <div className={cn(
      "flex flex-col items-center justify-between p-8 text-white min-h-screen",
      currentStyle.container
    )}>
      <audio
        ref={audioRef}
        src={phoneStyle === 'android' ? androidRingtone : iphoneRingtone}
        loop
      />
      <div className="flex flex-col items-center mt-12 space-y-4">
        <div className={cn(
          "flex items-center justify-center text-3xl font-bold",
          currentStyle.avatar
        )}>
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <h2 className={currentStyle.name}>{contact.name}</h2>
        <p className={currentStyle.number}>{contact.number}</p>
        {isActive && (
          <div className={cn("flex items-center space-x-2", currentStyle.timer)}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(callTimer)}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center space-y-8 mb-16">
        {!isActive && phoneStyle === 'iphone' ? (
          <div className="relative flex flex-col items-center space-y-4">
            <Slider
              defaultValue={[0]}
              max={100}
              step={1}
              value={sliderValue}
              onValueChange={handleSliderChange}
              className="w-64"
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-white/50" />
            </div>
            <p className="text-sm text-white/70">slide to answer</p>
          </div>
        ) : !isActive && phoneStyle === 'android' ? (
          <div className="flex justify-around w-full max-w-md">
            <button
              onClick={onEnd}
              className={cn(
                currentStyle.button,
                "bg-red-500 flex items-center justify-center"
              )}
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            <button
              onClick={handleAnswer}
              className={cn(
                currentStyle.button,
                "bg-green-500 flex items-center justify-center"
              )}
            >
              <Phone className="w-8 h-8" />
            </button>
          </div>
        ) : (
          <button
            onClick={onEnd}
            className={cn(
              currentStyle.button,
              "bg-red-500 flex items-center justify-center"
            )}
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

  const handleDeleteContact = (index: number) => {
    const updatedContacts = [...contacts];
    updatedContacts.splice(index, 1);
    setContacts(updatedContacts);
    toast({
      title: "Contact deleted",
      description: "The contact has been removed from your list.",
    });
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startCall(contact)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(index)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
