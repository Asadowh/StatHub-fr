import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail, Lock, User, Camera, Ruler } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { findCountryByName, countryDatabase, type CountryData } from '@/lib/countryData';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [height, setHeight] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [nationalityFlag, setNationalityFlag] = useState('');
  const [nationalityInput, setNationalityInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<CountryData[]>([]);
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [favoritePosition, setFavoritePosition] = useState('');
  const [personalQuote, setPersonalQuote] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [heightError, setHeightError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNationalityChange = (value: string) => {
    setNationalityInput(value);
    
    if (value.trim().length > 0) {
      const searchTerm = value.toLowerCase();
      const matches = countryDatabase.filter(country => 
        country.name.toLowerCase().includes(searchTerm) ||
        country.code.toLowerCase().includes(searchTerm)
      );
      setFilteredCountries(matches);
      setShowSuggestions(matches.length > 0 && value.trim().length > 0);
    } else {
      setFilteredCountries([]);
      setShowSuggestions(false);
    }
  };

  const selectCountry = (country: CountryData) => {
    setNationalityInput(country.name);
    setNationality(country.name);
    setNationalityFlag(country.flag);
    setShowSuggestions(false);
  };

  const validateHeight = (value: string): boolean => {
    if (!value || value === '') {
      setHeightError('');
      return true; // Height is optional
    }
    
    if (!/^\d+$/.test(value)) {
      setHeightError('Please enter a whole number between 0 and 250.');
      return false;
    }
    
    const numValue = parseInt(value, 10);
    if (numValue < 0 || numValue > 250) {
      setHeightError('Please enter a whole number between 0 and 250.');
      return false;
    }
    
    setHeightError('');
    return true;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const missingFields: string[] = [];
    if (!fullName) missingFields.push('Full Name');
    if (!username) missingFields.push('Username');
    if (!email) missingFields.push('Email');
    if (!password) missingFields.push('Password');
    if (!confirmPassword) missingFields.push('Confirm Password');
    if (!nationality) missingFields.push('Nationality');
    if (!birthDay) missingFields.push('Birth Day');
    if (!birthMonth) missingFields.push('Birth Month');
    if (!birthYear) missingFields.push('Birth Year');
    if (!favoritePosition) missingFields.push('Favorite Position');

    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return false;
    }

    if (username.length < 3) {
      toast({
        title: 'Error',
        description: 'Username must be at least 3 characters',
        variant: 'destructive',
      });
      return false;
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return false;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      toast({
        title: 'Error',
        description: 'Password must contain at least one uppercase letter',
        variant: 'destructive',
      });
      return false;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      toast({
        title: 'Error',
        description: 'Password must contain at least one lowercase letter',
        variant: 'destructive',
      });
      return false;
    }

    // Check for special character
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast({
        title: 'Error',
        description: 'Password must contain at least one special character',
        variant: 'destructive',
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }

    if (height && !validateHeight(height)) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirm_password', confirmPassword);
    formData.append('nationality', nationality);
    
    // Format birth date as YYYY-MM-DD
    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    formData.append('birth_date', birthDate);
    
    formData.append('favorite_position', favoritePosition);
    
    if (height) formData.append('height', height);
    if (jerseyNumber) formData.append('jersey_number', jerseyNumber);
    if (personalQuote) formData.append('personal_quote', personalQuote);
    
    // Handle photo upload
    const photoInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (photoInput?.files?.[0]) {
      formData.append('photo', photoInput.files[0]);
    }

    const result = await signup(formData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Please verify your email address to continue.',
      });
      // Redirect to email verification page
      navigate('/verify-email');
    } else {
      toast({
        title: 'Signup failed',
        description: result.error || 'Unable to create account',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4 py-8">
      <Card className="w-full max-w-2xl p-8 bg-card border-border/50">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Create account</h1>
          </div>
          <p className="text-muted-foreground">Join StatHub and track your football journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="max-h-[70vh] overflow-y-auto pr-4 relative">
            <div className="space-y-4 pb-4">
              {/* Profile Photo */}
              <div className="grid gap-2">
                <Label>Upload Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-primary/30">
                    <AvatarImage src={profilePhoto || undefined} alt="Profile" />
                    <AvatarFallback className="text-xl">
                      {fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      className="gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP (max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    minLength={3}
                  />
                </div>
                <p className="text-xs text-muted-foreground">At least 3 characters</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  At least 8 characters, one uppercase, one lowercase, and one special character
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) (Optional)</Label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="height"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g., 178"
                    value={height}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = value === '' ? 0 : parseInt(value, 10);
                        if (value === '' || numValue <= 250) {
                          setHeight(value);
                          if (value !== '') {
                            validateHeight(value);
                          } else {
                            setHeightError('');
                          }
                        }
                      }
                    }}
                    onBlur={() => {
                      if (height) {
                        validateHeight(height);
                      }
                    }}
                    className={`pl-10 ${heightError ? 'border-destructive' : ''}`}
                  />
                </div>
                {heightError && (
                  <p className="text-xs text-destructive">{heightError}</p>
                )}
              </div>

              {/* Jersey Number */}
              <div className="space-y-2">
                <Label htmlFor="jerseyNumber">Jersey Number (Optional)</Label>
                <Input
                  id="jerseyNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="1-99"
                  value={jerseyNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      const numValue = value === '' ? 0 : parseInt(value, 10);
                      if (value === '' || (numValue >= 1 && numValue <= 99)) {
                        setJerseyNumber(value);
                      }
                    }
                  }}
                />
              </div>

              {/* Nationality */}
              <div className="space-y-2 relative z-10">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  placeholder="Type country name (e.g., Azerbaijan, Turkey)"
                  value={nationalityInput}
                  onChange={(e) => handleNationalityChange(e.target.value)}
                  onFocus={() => {
                    if (nationalityInput.trim().length > 0 && filteredCountries.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={(e) => {
                    // Delay hiding to allow click on suggestion
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="bg-background border-border"
                  autoComplete="off"
                  required
                />
                {showSuggestions && filteredCountries.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-primary/30 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          selectCountry(country);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-accent/20 transition-colors flex items-center gap-3 border-b border-border/50 last:border-0 bg-card"
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <div className="flex-1">
                          <span className="text-foreground font-medium">{country.name}</span>
                          <span className="text-muted-foreground text-sm ml-2">({country.code})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {nationalityFlag && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                    <span>Selected:</span>
                    <span className="text-2xl">{nationalityFlag}</span>
                    <span>{nationality}</span>
                  </div>
                )}
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label>Birth Date *</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Day"
                    value={birthDay}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = value === '' ? 0 : parseInt(value, 10);
                        if (value === '' || (numValue >= 1 && numValue <= 31)) {
                          setBirthDay(value);
                        }
                      }
                    }}
                    required
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Month"
                    value={birthMonth}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = value === '' ? 0 : parseInt(value, 10);
                        if (value === '' || (numValue >= 1 && numValue <= 12)) {
                          setBirthMonth(value);
                        }
                      }
                    }}
                    required
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Year"
                    value={birthYear}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty or numeric input up to 4 digits
                      if (value === '' || /^\d+$/.test(value)) {
                        // Allow typing up to 4 digits, validate range only when complete
                        if (value === '' || value.length <= 4) {
                          setBirthYear(value);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const numValue = parseInt(value, 10);
                        // Validate range on blur
                        if (numValue < 1900 || numValue > new Date().getFullYear()) {
                          toast({
                            title: 'Invalid year',
                            description: `Please enter a year between 1900 and ${new Date().getFullYear()}`,
                            variant: 'destructive',
                          });
                        }
                      }
                    }}
                    required
                  />
                </div>
              </div>

              {/* Favorite Position */}
              <div className="space-y-2">
                <Label htmlFor="position">Favorite Position *</Label>
                <Select
                  value={favoritePosition}
                  onValueChange={(value) => setFavoritePosition(value)}
                  required
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GK">GK - Goalkeeper</SelectItem>
                    <SelectItem value="RB">RB - Right Back</SelectItem>
                    <SelectItem value="CB">CB - Center Back</SelectItem>
                    <SelectItem value="LB">LB - Left Back</SelectItem>
                    <SelectItem value="CDM">CDM - Defensive Midfielder</SelectItem>
                    <SelectItem value="CM">CM - Center Midfielder</SelectItem>
                    <SelectItem value="CAM">CAM - Attacking Midfielder</SelectItem>
                    <SelectItem value="RW">RW - Right Winger</SelectItem>
                    <SelectItem value="LW">LW - Left Winger</SelectItem>
                    <SelectItem value="ST">ST - Striker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Personal Quote */}
              <div className="space-y-2">
                <Label htmlFor="quote">Personal Quote (Optional)</Label>
                <Input
                  id="quote"
                  value={personalQuote}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 120) {
                      setPersonalQuote(value);
                    }
                  }}
                  placeholder="Add a short motto or expression"
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">
                  {personalQuote.length}/120 characters
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !!heightError}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
