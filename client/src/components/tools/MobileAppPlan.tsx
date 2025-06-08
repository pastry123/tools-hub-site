import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Smartphone, Tablet, Download, Star, Calendar, 
  CheckCircle, Clock, Users, Zap, Globe, Bell,
  Camera, File, Edit, Share, Cloud, Shield,
  Play, Apple, Monitor, Code
} from "lucide-react";

interface Feature {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'testing';
  priority: 'high' | 'medium' | 'low';
  estimatedCompletion: string;
  category: string;
}

interface AppVersion {
  version: string;
  platform: string;
  releaseDate: string;
  features: string[];
  status: 'released' | 'beta' | 'planned';
  downloads?: number;
}

export default function MobileAppPlan() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('overview');

  const features: Feature[] = [
    {
      id: 'offline-pdf',
      name: 'Offline PDF Processing',
      description: 'Process PDF files without internet connection',
      status: 'in-progress',
      priority: 'high',
      estimatedCompletion: 'Q2 2024',
      category: 'PDF Tools'
    },
    {
      id: 'camera-scan',
      name: 'Camera QR/Barcode Scanner',
      description: 'Scan codes directly from camera feed',
      status: 'completed',
      priority: 'high',
      estimatedCompletion: 'Q1 2024',
      category: 'Scanner'
    },
    {
      id: 'batch-export',
      name: 'Batch Export to Cloud',
      description: 'Export multiple processed files to cloud storage',
      status: 'planned',
      priority: 'medium',
      estimatedCompletion: 'Q3 2024',
      category: 'Cloud Integration'
    },
    {
      id: 'offline-image',
      name: 'Offline Image Processing',
      description: 'Basic image editing without internet',
      status: 'in-progress',
      priority: 'high',
      estimatedCompletion: 'Q2 2024',
      category: 'Image Tools'
    },
    {
      id: 'push-notifications',
      name: 'Processing Notifications',
      description: 'Get notified when batch jobs complete',
      status: 'planned',
      priority: 'low',
      estimatedCompletion: 'Q4 2024',
      category: 'User Experience'
    },
    {
      id: 'widget-support',
      name: 'Home Screen Widgets',
      description: 'Quick access widgets for common tools',
      status: 'planned',
      priority: 'medium',
      estimatedCompletion: 'Q3 2024',
      category: 'User Experience'
    }
  ];

  const appVersions: AppVersion[] = [
    {
      version: '1.0.0',
      platform: 'iOS',
      releaseDate: 'March 2024',
      features: ['Basic PDF tools', 'QR Generator', 'Image resize'],
      status: 'released',
      downloads: 50000
    },
    {
      version: '1.0.0',
      platform: 'Android',
      releaseDate: 'March 2024',
      features: ['Basic PDF tools', 'QR Generator', 'Image resize'],
      status: 'released',
      downloads: 125000
    },
    {
      version: '1.2.0',
      platform: 'iOS',
      releaseDate: 'May 2024',
      features: ['Batch processing', 'Cloud sync', 'Enhanced UI'],
      status: 'beta'
    },
    {
      version: '1.2.0',
      platform: 'Android',
      releaseDate: 'June 2024',
      features: ['Batch processing', 'Cloud sync', 'Enhanced UI'],
      status: 'planned'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'testing': return 'bg-yellow-500';
      case 'planned': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getOverallProgress = () => {
    const completed = features.filter(f => f.status === 'completed').length;
    return Math.round((completed / features.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">ToolHub Mobile App</h1>
        <p className="text-gray-600">Bring the power of ToolHub to your mobile device</p>
      </div>

      <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Smartphone className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-xl font-semibold mb-2">iOS App</h3>
                <p className="text-gray-600 mb-4">Native iOS experience with all core features</p>
                <Badge variant="default">Available on App Store</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Tablet className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Android App</h3>
                <p className="text-gray-600 mb-4">Full-featured Android application</p>
                <Badge variant="default">Available on Play Store</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-semibold mb-2">Desktop PWA</h3>
                <p className="text-gray-600 mb-4">Progressive web app for desktop</p>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Development Progress</span>
                <span className="text-2xl font-bold">{getOverallProgress()}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={getOverallProgress()} className="mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {features.filter(f => f.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {features.filter(f => f.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {features.filter(f => f.status === 'testing').length}
                  </div>
                  <div className="text-sm text-gray-600">Testing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {features.filter(f => f.status === 'planned').length}
                  </div>
                  <div className="text-sm text-gray-600">Planned</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>App Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">175K+</div>
                  <div className="text-gray-600">Total Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">4.8⭐</div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">12+</div>
                  <div className="text-gray-600">Core Features</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Development Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(feature.status)}`}></div>
                        <h3 className="font-medium">{feature.name}</h3>
                        <Badge variant={getPriorityColor(feature.priority)}>
                          {feature.priority}
                        </Badge>
                        <Badge variant="outline">{feature.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {feature.estimatedCompletion}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mobile-Specific Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded">
                  <Camera className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Camera Integration</h4>
                    <p className="text-sm text-gray-600">Scan documents and codes with camera</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded">
                  <File className="w-8 h-8 text-green-500" />
                  <div>
                    <h4 className="font-medium">File System Access</h4>
                    <p className="text-sm text-gray-600">Import files from device storage</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded">
                  <Share className="w-8 h-8 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Native Share</h4>
                    <p className="text-sm text-gray-600">Share processed files to other apps</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded">
                  <Bell className="w-8 h-8 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Get notified about processing status</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Release Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {appVersions.map((version, index) => (
                  <div key={index} className="flex items-start gap-4 pb-6 border-b last:border-b-0">
                    <div className="flex-shrink-0">
                      {version.platform === 'iOS' ? (
                        <Apple className="w-8 h-8 text-gray-600" />
                      ) : (
                        <Smartphone className="w-8 h-8 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">
                          {version.platform} v{version.version}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            version.status === 'released' ? 'default' :
                            version.status === 'beta' ? 'secondary' : 'outline'
                          }>
                            {version.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{version.releaseDate}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {version.features.map((feature, featureIndex) => (
                          <Badge key={featureIndex} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      {version.downloads && (
                        <p className="text-sm text-gray-600">
                          {version.downloads.toLocaleString()} downloads
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Q3 2024</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Advanced OCR capabilities</li>
                    <li>• Tablet-optimized UI</li>
                    <li>• Cloud storage integration</li>
                    <li>• Batch processing improvements</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Q4 2024</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Apple Watch companion app</li>
                    <li>• Shortcuts integration</li>
                    <li>• Enhanced security features</li>
                    <li>• Multi-language support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="download" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Apple className="w-16 h-16 mx-auto mb-4 text-gray-800" />
                <h3 className="text-xl font-semibold mb-2">Download for iOS</h3>
                <p className="text-gray-600 mb-4">
                  Available on the App Store for iPhone and iPad
                </p>
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download from App Store
                  </Button>
                  <div className="text-sm text-gray-500">
                    Requires iOS 14.0 or later
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Play className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">Download for Android</h3>
                <p className="text-gray-600 mb-4">
                  Available on Google Play Store for Android devices
                </p>
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download from Play Store
                  </Button>
                  <div className="text-sm text-gray-500">
                    Requires Android 8.0 (API level 26) or higher
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Beta Testing Program</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-medium mb-2">Join Our Beta Program</h3>
                <p className="text-gray-600 mb-4">
                  Get early access to new features and help shape the future of ToolHub mobile
                </p>
                <Button variant="outline" size="lg">
                  <Star className="w-5 h-5 mr-2" />
                  Become a Beta Tester
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">iOS Requirements</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• iOS 14.0 or later</li>
                    <li>• iPhone 7 or newer</li>
                    <li>• iPad (6th generation) or newer</li>
                    <li>• 100 MB free storage space</li>
                    <li>• Internet connection for cloud features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Android Requirements</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Android 8.0 (API level 26) or higher</li>
                    <li>• 2 GB RAM minimum</li>
                    <li>• 150 MB free storage space</li>
                    <li>• Camera permission for scanning</li>
                    <li>• Internet connection for cloud features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}