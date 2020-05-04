import React, { useContext, useState } from "react";
import { Tab, Header, Card, Image, Button, Grid } from "semantic-ui-react";
import { RootStoreContext } from "../../app/stores/rootStore";
import { observer } from "mobx-react-lite";
import PhotoUploadWidget from "../../app/common/photoUpload/PhotoUploadWidget";

export const ProfilePhotos: React.FC = observer(() => {
  const { profileStore } = useContext(RootStoreContext);
  const {
    isCurrentUser,
    loading,
    profile,
    deletePhoto,
    setMainPhoto,
    uploadPhoto,
    uploadingPhoto,
  } = profileStore;
  const [addPhotoMode, setAddPhotoMode] = useState(false);
  const [target, setTarget] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<string | undefined>(
    undefined
  );
  const handleUploadImage = (photo: Blob) => {
    uploadPhoto(photo).then(() => setAddPhotoMode(false));
  };
  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16} style={{ paddingBottom: 0 }}>
          <Header floated="left" icon="image" content="Photos" />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={addPhotoMode ? "Cancel" : "Add Photo"}
              onClick={() => setAddPhotoMode(!addPhotoMode)}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          {addPhotoMode ? (
            <PhotoUploadWidget
              uploadPhoto={handleUploadImage}
              loading={uploadingPhoto}
            />
          ) : (
            <Card.Group itemsPerRow={5}>
              {profile?.photos.map((p) => (
                <Card key={p.id}>
                  <Image src={p.url} />
                  {isCurrentUser && (
                    <Button.Group fluid widths={2}>
                      <Button
                        name={p.id}
                        onClick={(e) => {
                          setMainPhoto(p);
                          setTarget(e.currentTarget.name);
                        }}
                        loading={loading && target === p.id}
                        disabled={p.isMain}
                        basic
                        positive
                        content="Main"
                      />
                      <Button
                        name={p.id}
                        disabled={p.isMain}
                        onClick={(e) => {
                          deletePhoto(p);
                          setDeleteTarget(e.currentTarget.name);
                        }}
                        loading={loading && deleteTarget === p.id}
                        basic
                        negative
                        icon="trash"
                      />
                    </Button.Group>
                  )}
                </Card>
              ))}
            </Card.Group>
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
});
